package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"pulsepoll/config"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow any origin for easy cross-origin realtime access during dev & deployment
		return true
	},
}

// Client represents a connected websocket client
type Client struct {
	PollID string
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *Hub
}

// Hub manages active clients and subscriptions per poll
type Hub struct {
	// Registered clients mapped by pollID -> map[*Client]bool
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan BroadcastMessage
	mu         sync.RWMutex
}

type BroadcastMessage struct {
	PollID  string
	Payload []byte
}

var GlobalHub *Hub

func InitHub() {
	GlobalHub = &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan BroadcastMessage, 1024),
	}
	go GlobalHub.run()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.rooms[client.PollID]; !ok {
				h.rooms[client.PollID] = make(map[*Client]bool)
				// Subscribe to Redis pubsub channel for this poll
				go h.listenRedisChannel(client.PollID)
			}
			h.rooms[client.PollID][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.PollID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.rooms, client.PollID)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := h.rooms[message.PollID]
			for client := range clients {
				select {
				case client.Send <- message.Payload:
				default:
					close(client.Send)
					delete(clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// listenRedisChannel listens to Redis Pub/Sub for cross-instance real-time fan-out
func (h *Hub) listenRedisChannel(pollID string) {
	channelName := fmt.Sprintf("poll:%s:updates", pollID)
	pubsub := config.RDB.Subscribe(context.Background(), channelName)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		h.mu.RLock()
		count := len(h.rooms[pollID])
		h.mu.RUnlock()

		if count == 0 {
			// No more clients for this poll
			return
		}

		h.broadcast <- BroadcastMessage{
			PollID:  pollID,
			Payload: []byte(msg.Payload),
		}
	}
}

// PublishPollUpdate publishes an update event to Redis Pub/Sub
func PublishPollUpdate(pollID string, data interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	channelName := fmt.Sprintf("poll:%s:updates", pollID)
	return config.RDB.Publish(ctx, channelName, payload).Err()
}

// HandleWebSocket upgrades HTTP connection and registers to poll room
func HandleWebSocket(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll ID required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	client := &Client{
		PollID: pollID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    GlobalHub,
	}

	GlobalHub.register <- client

	// Start pump routines
	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// The Hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

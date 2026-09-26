import { useState, useEffect } from 'react';
import { getDB, updateDB } from '../db';
import type { Webhook } from '../db/schema';

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  const loadWebhooks = () => {
    const db = getDB();
    setWebhooks(db.webhooks || []);
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const createWebhook = (webhookData: Omit<Webhook, 'id' | 'createdAt' | 'stats'>) => {
    updateDB((db) => {
      if (!db.webhooks) {
        db.webhooks = [];
      }
      const newWebhook: Webhook = {
        ...webhookData,
        id: `WH-${Date.now()}`,
        createdAt: new Date().toISOString(),
        stats: {
          totalDeliveries: 0,
          successRate: 0,
          lastDelivery: null,
        },
      };
      db.webhooks.push(newWebhook);
    });
    loadWebhooks();
  };

  const updateWebhook = (id: string, updates: Partial<Webhook>) => {
    updateDB((db) => {
      if (!db.webhooks) return;
      const index = db.webhooks.findIndex((w: Webhook) => w.id === id);
      if (index !== -1) {
        db.webhooks[index] = { ...db.webhooks[index], ...updates };
      }
    });
    loadWebhooks();
  };

  const deleteWebhook = (id: string) => {
    updateDB((db) => {
      if (!db.webhooks) return;
      db.webhooks = db.webhooks.filter((w: Webhook) => w.id !== id);
    });
    loadWebhooks();
  };

  const testWebhook = async (id: string) => {
    // Simulate webhook test
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    updateDB((db) => {
      if (!db.webhooks) return;
      const webhook = db.webhooks.find((w: Webhook) => w.id === id);
      if (webhook) {
        webhook.stats.totalDeliveries += 1;
        webhook.stats.successRate = 100;
        webhook.stats.lastDelivery = new Date().toISOString();
      }
    });
    loadWebhooks();
  };

  return {
    webhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
}

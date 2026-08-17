import { db } from '../database/store.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { Conversation, Message, SenderType, ConversationStatus } from '../models/types.js';

export async function getOrCreateSupportConversation(
  visitorId: string,
  userId?: string | null
): Promise<Conversation> {
  if (!visitorId) {
    throw new BadRequestError('visitorId is required.');
  }
  return db.getOrCreateConversation(visitorId, userId);
}

export async function sendSupportMessage(data: {
  conversationId: string;
  senderType?: SenderType;
  message: string;
}): Promise<Message> {
  if (!data.conversationId) {
    throw new BadRequestError('conversationId is required.');
  }
  if (!data.message || !data.message.trim()) {
    throw new BadRequestError('Message text cannot be empty.');
  }

  const senderType = data.senderType || SenderType.CUSTOMER;
  const msg = await db.addMessage(data.conversationId, senderType, data.message.trim());
  if (!msg) {
    throw new NotFoundError('Conversation not found.');
  }

  // Automated assistant reply if it's the customer speaking to give an authentic Tawk.to-style instant support experience
  if (senderType === SenderType.CUSTOMER) {
    setTimeout(async () => {
      const lower = data.message.toLowerCase();
      let reply = "Thank you for reaching out! A support representative has received your message and will respond shortly.";
      
      if (lower.includes('crypto') || lower.includes('payment') || lower.includes('bitcoin') || lower.includes('usdt')) {
        reply = "Notice: AllCardStation will support direct crypto payments (BTC, ETH, LTC, SOL, USDT, USDC) in Phase 3. Traditional payment cards are strictly not used.";
      } else if (lower.includes('validation') || lower.includes('verify') || lower.includes('balance')) {
        reply = "For card validation assistance, please check our Validate Card portal or ensure your code does not contain scratched-off characters.";
      } else if (lower.includes('order') || lower.includes('buy') || lower.includes('purchase')) {
        reply = "Digital gift card purchasing and fulfillment will be activated upon launch of our Phase 3 cryptocurrency gateway.";
      }

      await db.addMessage(data.conversationId, SenderType.AI_ASSISTANT, reply);
    }, 1200);
  }

  return msg;
}

export async function listAllConversations(status?: string) {
  return db.getAllConversations(status as ConversationStatus);
}

export async function getConversationDetails(conversationId: string) {
  const conv = await db.getConversationById(conversationId);
  if (!conv) {
    throw new NotFoundError('Conversation not found.');
  }
  return conv;
}

export async function updateConversationStatus(conversationId: string, status: string) {
  const validStatuses = ['OPEN', 'WAITING', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
  }
  const updated = await db.updateConversationStatus(conversationId, status as ConversationStatus);
  if (!updated) {
    throw new NotFoundError('Conversation not found.');
  }
  return updated;
}

export async function getAdminSupportStats() {
  return db.getSystemStats();
}


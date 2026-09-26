import { useDB } from '../contexts/DataContext';
import type { CollectionCase, ContactChannel } from '../db/schema';
import { canContactBorrower, logCollectionContact, raiseAlert } from '../db/services';

export function useCollections() {
  const { db, mutate, audit } = useDB();
  
  const emptyState = {
    cases: [] as CollectionCase[],
    contacts: [],
    contactBorrower: async () => { throw new Error('DB not ready'); },
    logPTP: async () => { throw new Error('DB not ready'); },
    escalate: async () => { throw new Error('DB not ready'); },
  };
  
  if (!db) return emptyState;

  const cases = db.collectionCases as CollectionCase[];
  const contacts = db.collectionContacts;

  // Contact borrower (with conduct rules enforcement)
  const contactBorrower = async (caseId: string, channel: ContactChannel, templateId: string, content: string) => {
    const check = canContactBorrower(db, caseId, channel);
    if (!check.allowed) {
      raiseAlert(db, 'conduct_violation', 'high', 'Contact Blocked', check.reason || 'Contact not permitted', 'CollectionCase', caseId);
      mutate(() => {}); // refresh
      throw new Error(check.reason);
    }

    const contact = await logCollectionContact(db, caseId, channel, templateId, content, 'U-JANE');
    mutate(() => {});
    await audit('COLLECTION_CONTACT', 'CollectionCase', caseId, `Contact sent via ${channel}. Template: ${templateId}`, undefined, contact);
    return contact;
  };

  // Log promise-to-pay
  const logPTP = async (caseId: string, amount: number, date: string) => {
    mutate(d => {
      const c = d.collectionCases.find((x: CollectionCase) => x.id === caseId);
      if (c) {
        c.status = 'ptp';
        c.promiseToPay = { date, amount, status: 'pending', loggedAt: new Date().toISOString() };
        c.updatedAt = new Date().toISOString();
      }
    });
    await audit('PTP_LOGGED', 'CollectionCase', caseId, `Promise-to-pay: KES ${amount.toLocaleString()} by ${date}. 48-hour cooling-off activated.`, undefined, { amount, date });
  };

  // Escalate case
  const escalate = async (caseId: string, reason: string) => {
    mutate(d => {
      const c = d.collectionCases.find((x: CollectionCase) => x.id === caseId);
      if (c) {
        c.status = 'escalated';
        c.updatedAt = new Date().toISOString();
      }
    });
    await audit('CASE_ESCALATED', 'CollectionCase', caseId, `Escalated: ${reason}`, undefined, { reason });
  };

  return { cases, contacts, contactBorrower, logPTP, escalate };
}

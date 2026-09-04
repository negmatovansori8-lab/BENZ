import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import { Seo } from '../components/Seo';
import { api } from '../services/api';
import type { ChatMessage, Conversation } from '../types';
import { useAuth } from '../context/AuthContext';
import { avatarUrl, cn, timeAgo } from '../utils/format';
import { EmptyState } from '../components/EmptyState';

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const loadList = () => api.get('/messages').then((r) => setList(r.data.data || []));

  useEffect(() => {
    loadList().catch(() => {});
    const t = setInterval(() => loadList().catch(() => {}), 12000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const id = conversationId || (list[0] && String(list[0].id));
    if (!id) {
      setActive(null);
      setMessages([]);
      return;
    }
    api.get(`/messages/${id}`).then((r) => {
      setMessages(r.data.messages || []);
      setActive(list.find((c) => String(c.id) === String(id)) || r.data.conversation);
    }).catch(() => {});
  }, [conversationId, list]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${active.id}`, { content: text });
      setMessages((m) => [...m, data.message]);
      setText('');
      loadList();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-ah py-8">
      <Seo title="Messages — BENZ" />
      <h1 className="font-display mb-6 text-3xl">Messages</h1>
      {!list.length ? (
        <EmptyState icon={MessageSquare} title="No conversations" text="Message a seller from a car page to start chatting." action={{ to: '/cars', label: 'Browse cars' }} />
      ) : (
        <div className="card grid min-h-[70vh] overflow-hidden md:grid-cols-[300px_1fr]">
          <aside className="border-b border-[var(--ah-line)] md:border-b-0 md:border-r">
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/messages/${c.id}`)}
                className={cn('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5', String(active?.id) === String(c.id) && 'bg-gold-500/10')}
              >
                <img src={avatarUrl(c.other_name, c.other_avatar)} alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between text-sm font-medium">
                    {c.other_name}
                    {c.unread > 0 && <span className="rounded-full bg-gold-500 px-1.5 text-[10px] text-zinc-950">{c.unread}</span>}
                  </span>
                  <span className="block truncate text-xs text-[var(--ah-muted)]">{c.brand} {c.model}</span>
                  <span className="block truncate text-xs text-[var(--ah-muted)]">{c.last_message}</span>
                </span>
              </button>
            ))}
          </aside>
          <section className="flex flex-col">
            {active ? (
              <>
                <header className="border-b border-[var(--ah-line)] px-5 py-4">
                  <p className="font-semibold">{active.other_name}</p>
                  <p className="text-xs text-[var(--ah-muted)]">{active.brand} {active.model}</p>
                </header>
                <div className="flex-1 space-y-3 overflow-auto p-5">
                  {messages.map((m) => (
                    <div key={m.id} className={cn('max-w-[75%] rounded-2xl px-4 py-2 text-sm', m.sender_id === user?.id ? 'ml-auto bg-gold-500 text-zinc-950' : 'bg-black/5 dark:bg-white/10')}>
                      <p>{m.content}</p>
                      <p className="mt-1 text-[10px] opacity-70">{timeAgo(m.created_at)}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={send} className="flex gap-2 border-t border-[var(--ah-line)] p-4">
                  <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
                  <button className="btn-gold !px-4" disabled={sending}><Send className="h-4 w-4" /></button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-[var(--ah-muted)]">Select a conversation</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

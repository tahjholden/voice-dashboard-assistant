'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Row = { id: string; content: string | null; audio_url: string | null; created_at: string };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('voice_intake')
        .select('*')
        .order('created_at', { ascending: false });
      setRows(data || []);
    };
    load();

    const channel = supabase
      .channel('realtime:voice_intake')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'voice_intake' },
        payload => setRows(r => [payload.new as Row, ...r])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-4">
        {rows.map(r => (
          <li key={r.id} className="border p-4 rounded">
            <p className="mb-2">{r.content || <em>(audio upload)</em>}</p>
            {r.audio_url && (
              <audio controls src={r.audio_url} className="w-full" />
            )}
            <span className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

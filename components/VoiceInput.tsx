'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VoiceInput() {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);

  // Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      setTranscript(text);
    };

    if (recording) recognition.start();
    else recognition.stop();
    return () => recognition.stop();
  }, [recording]);

  // Submit to Supabase
  const submit = async (audioUrl?: string) => {
    if (!transcript && !audioUrl) return;
    await supabase.from('voice_intake').insert({
      content: transcript,
      audio_url: audioUrl ?? null
    });
    setTranscript('');
  };

  // Fallback: audio file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${Date.now()}_${file.name}`, file);
    if (error) return alert(error.message);
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
      '/rest/v1',
      ''
    )}/storage/v1/object/public/${data.path}`;
    await submit(url);
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border p-2"
        rows={3}
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        placeholder="Speak or type…"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRecording(r => !r)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {recording ? 'Stop' : 'Start'} Voice
        </button>
        <button
          onClick={() => submit()}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Send
        </button>
        <input
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          className="border p-2"
        />
      </div>
    </div>
  );
}

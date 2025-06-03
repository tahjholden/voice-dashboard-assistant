import VoiceInput from '@/components/VoiceInput';

export const metadata = { title: 'Voice Assistant' };

export default function AssistantPage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chat / Voice Assistant</h1>
      <VoiceInput />
    </main>
  );
}

export async function enhanceSymptomDescription(currentDescription: string, symptoms: string[], userPrompt: string): Promise<ReadableStream<string>> {
  const response = await fetch('/api/enhance-symptoms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentDescription,
      symptoms,
      userPrompt
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance symptom description');
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    start(controller) {
      const reader = response.body!.getReader();
      
      function push(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          
          const text = decoder.decode(value);
          controller.enqueue(text);
          return push();
        });
      }
      
      return push();
    }
  });

  return stream;
}
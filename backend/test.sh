#!/bin/bash

# Test OpenAI chat completions endpoint with a simple question
curl -X POST http://localhost:8000/api/openai/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is 2+2?"}]
  }'

echo ""
echo "---"

# Test with system message and parameters
curl -X POST http://localhost:8000/api/openai/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello in 3 different languages"}
    ],
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 100
  }'

echo ""
echo "---"

# Test with conversation history
curl -X POST http://localhost:8000/api/openai/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "My name is Alice"},
      {"role": "assistant", "content": "Nice to meet you, Alice!"},
      {"role": "user", "content": "What is my name?"}
    ]
  }'
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiResponse {
  message?: string;
  id?: string;
  model?: string;
  choices?: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export default function TestingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Hello, how are you?");

  const testBasicEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:8000/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const testOpenAIEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:8000/api/openai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.7,
            max_tokens: 150,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend API Testing</h1>
          <p className="text-muted-foreground">
            Test the connection between frontend and backend APIs
          </p>
        </div>

        <div className="grid gap-6">
          {/* Basic Endpoint Test */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Endpoint Test</CardTitle>
              <CardDescription>
                Test the basic root endpoint of the backend API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testBasicEndpoint}
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? "Testing..." : "Test Basic Endpoint"}
              </Button>

              {response && (
                <div className="mt-4">
                  <Badge variant="secondary" className="mb-2">
                    Response:
                  </Badge>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Endpoint */}
          <Card>
            <CardHeader>
              <CardTitle>Test Endpoint</CardTitle>
              <CardDescription>
                Test the dedicated test endpoint of the backend API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testEndpoint}
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? "Testing..." : "Test Endpoint"}
              </Button>

              {response && (
                <div className="mt-4">
                  <Badge variant="secondary" className="mb-2">
                    Response:
                  </Badge>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* OpenAI Endpoint Test */}
          <Card>
            <CardHeader>
              <CardTitle>OpenAI Chat Completion Test</CardTitle>
              <CardDescription>
                Test the OpenAI chat completion endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message to send:</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="mt-2"
                  />
                </div>

                <Button onClick={testOpenAIEndpoint} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Test OpenAI Endpoint"}
                </Button>

                {response && (
                  <div className="mt-4">
                    <Badge variant="secondary" className="mb-2">
                      Response:
                    </Badge>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                1. Make sure your backend server is running on{" "}
                <code className="bg-muted px-1 rounded">localhost:8000</code>
              </p>
              <p>
                2. For the OpenAI test, ensure you have set up your{" "}
                <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code>{" "}
                environment variable
              </p>
              <p>
                3. If you get CORS errors, you may need to configure CORS in
                your backend
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Key } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeySetupProps {
  onSetup: (apiKey: string, accessToken: string) => void;
}

export const ApiKeySetup = ({ onSetup }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!apiKey.trim() || !accessToken.trim()) {
        throw new Error("Please enter both API Key and Access Token");
      }

      // Test the credentials with a simple API call
      const testResponse = await fetch('https://api.themoviedb.org/3/movie/popular?page=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error("Invalid credentials. Please check your TMDB API Key and Access Token.");
      }

      onSetup(apiKey.trim(), accessToken.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to verify credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Key className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup TMDB API</CardTitle>
          <CardDescription>
            Enter your TMDB API credentials to get started with real movie data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your TMDB API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessToken">API Read Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your TMDB Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Save Credentials"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            <p>
              Don't have TMDB API credentials?{" "}
              <a
                href="https://developer.themoviedb.org/docs/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get them here
              </a>
            </p>
            <p className="mt-2">
              Your credentials are stored securely in your browser's local storage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
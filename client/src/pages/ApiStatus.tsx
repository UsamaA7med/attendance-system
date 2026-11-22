import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Activity, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

export function ApiStatus() {
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const testAxiosCall = async () => {
    setLoading(true);
    setStatus("idle");
    setResponseLog(null);

    try {
      // Testing with a public placeholder endpoint to demonstrate active Axios integration
      const res = await api.get("https://jsonplaceholder.typicode.com/todos/1");
      setStatus("success");
      setResponseLog(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      setStatus("error");
      const error = err as { message?: string };
      setResponseLog(`Error: ${error?.message || "Failed to make request"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Axios Client & Server Integration
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Pre-configured Axios client ready to communicate with your backend server.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              Axios Configuration
            </CardTitle>
            <CardDescription>
              Settings defined in <code className="text-xs">src/lib/api.ts</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-neutral-100 dark:bg-neutral-900 p-4 font-mono text-xs space-y-2">
              <div>
                <span className="text-neutral-500">Base URL: </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {api.defaults.baseURL}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Timeout: </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">10,000 ms</span>
              </div>
              <div>
                <span className="text-neutral-500">Auth Interceptor: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active (Bearer Token)</span>
              </div>
            </div>

            <Button
              onClick={testAxiosCall}
              disabled={loading}
              className="w-full gap-2 font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  Test Axios Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Response Preview</CardTitle>
              <CardDescription>Live result from test endpoint</CardDescription>
            </div>
            {status === "success" && (
              <Badge variant="default" className="bg-emerald-600 gap-1">
                <CheckCircle className="h-3 w-3" /> 200 OK
              </Badge>
            )}
            {status === "error" && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Error
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {responseLog ? (
              <pre className="rounded-md bg-neutral-950 p-4 text-xs font-mono text-neutral-100 overflow-x-auto max-h-60">
                {responseLog}
              </pre>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-neutral-300 dark:border-neutral-800 text-xs text-neutral-400">
                Click "Test Axios Request" to inspect output
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

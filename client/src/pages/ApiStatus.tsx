import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, setAccessToken } from "@/lib/api";
import { Activity, CheckCircle, RefreshCw, AlertCircle, UserPlus, Server } from "lucide-react";
import { toast } from "sonner";

export function ApiStatus() {
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusBadge, setStatusBadge] = useState<string>("200 OK");

  const testServerApi = async () => {
    setLoading(true);
    setStatus("idle");
    setResponseLog(null);

    try {
      const res = await api.get("/");
      setStatus("success");
      setStatusBadge("200 OK");
      setResponseLog(JSON.stringify(res.data, null, 2));
      toast.success("Backend Server Reachable", {
        description: `Connected to ${api.defaults.baseURL}`,
      });
    } catch (err: unknown) {
      setStatus("error");
      setStatusBadge("Error");
      const error = err as { message?: string; response?: { data?: unknown } };
      setResponseLog(
        JSON.stringify(
          {
            error: error.message || "Failed to make request",
            details: error.response?.data,
          },
          null,
          2
        )
      );
      toast.error("Failed to connect to backend", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegisterEndpoint = async () => {
    setLoading(true);
    setStatus("idle");
    setResponseLog(null);

    const testStaffEmail = `staff.test.${Date.now()}@attendance.local`;
    try {
      const res = await api.post("/auth/register", {
        name: "Test Staff Member",
        email: testStaffEmail,
        password: "password123",
      });

      setStatus("success");
      setStatusBadge("201 Created");
      setResponseLog(JSON.stringify(res.data, null, 2));

      if (res.data?.data?.accessToken) {
        setAccessToken(res.data.data.accessToken);
      }

      toast.success("Register Endpoint Verified!", {
        description: `Created user with role: ${res.data?.data?.user?.role} (Staff assigned automatically)`,
      });
    } catch (err: unknown) {
      setStatus("error");
      setStatusBadge("Error");
      const error = err as { message?: string; response?: { data?: unknown; status?: number } };
      setResponseLog(
        JSON.stringify(
          {
            status: error.response?.status,
            error: error.message || "Registration test failed",
            details: error.response?.data,
          },
          null,
          2
        )
      );
      toast.error("Registration endpoint test failed", {
        description: error.message,
      });
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
          Pre-configured Axios client connected to the backend API and auth endpoints.
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
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active (Bearer Access Token)</span>
              </div>
              <div>
                <span className="text-neutral-500">Refresh Flow: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Automatic 401 Interceptor + httpOnly Cookie</span>
              </div>
              <div>
                <span className="text-neutral-500">Registration Role: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enforced as STAFF automatically</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={testServerApi}
                disabled={loading}
                variant="outline"
                className="flex-1 gap-2 font-medium"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
                Test API Root
              </Button>

              <Button
                onClick={testRegisterEndpoint}
                disabled={loading}
                className="flex-1 gap-2 font-medium"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Test Register Staff
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Response Preview</CardTitle>
              <CardDescription>Live result from backend endpoint</CardDescription>
            </div>
            {status === "success" && (
              <Badge variant="default" className="bg-emerald-600 gap-1">
                <CheckCircle className="h-3 w-3" /> {statusBadge}
              </Badge>
            )}
            {status === "error" && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> {statusBadge}
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
                Click a test button to inspect output
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

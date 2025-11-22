"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Workflow, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { getMeUrl } from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  is_active: boolean;
}

export default function AutomationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("bai_token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(getMeUrl(), {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data");
        }

        const userData = await response.json();
        setUser(userData);
        
        // Check if user is admin (email check)
        setIsAdmin(userData.email === "admin@bai.com");
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleAskBAI = () => {
    // Navigate to dashboard with automation consultation action
    router.push("/dashboard?action=automation_consult");
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Workflow className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automation Center</h1>
            <p className="text-sm text-gray-600">Manage your workflows and AI agents</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Active Workflows Grid - Visible for everyone */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Active Workflows</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Email Automation</h3>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">Automated email responses and routing</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Data Sync</h3>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">Synchronize data across platforms</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Report Generator</h3>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600">Weekly automated reports</p>
              </div>
            </div>
          </div>

          {/* Conditional Action Section */}
          {isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          ) : isAdmin ? (
            /* Admin: Show Workflow Editor Button */
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Workflow Editor</h3>
                  <p className="text-sm text-gray-600">
                    Create and manage your automation workflows with n8n
                  </p>
                </div>
                <Link href="http://localhost:5678" target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" className="flex items-center gap-2">
                    <span>Open Workflow Editor</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Client: Show Premium Support Card */
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Premium Support</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Need to automate a new process? Ask B.A.I. to set it up for you.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAskBAI}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Ask B.A.I.</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


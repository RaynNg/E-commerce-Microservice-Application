"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/api";
import { isStaffAuthenticated, getStaffSession, logoutStaff } from "@/lib/staff-auth";
import { Database, Server, LogIn, LogOut, Package } from "lucide-react";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const session = getStaffSession();
    setAuthenticated(!!session);
    setUsername(session?.username ?? null);
  }, []);

  const handleLogout = () => {
    logoutStaff();
    setAuthenticated(false);
    setUsername(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ShopMicro Admin Studio
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Quản lý và xem dữ liệu của các microservices trong hệ thống
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {authenticated ? (
            <>
              <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-sm text-green-700">
                Đã đăng nhập: <strong>{username}</strong>
              </div>
              <Button asChild>
                <Link href="/service/product">
                  <Package className="mr-2 h-4 w-4" />
                  Quản lý sản phẩm
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập staff
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/service/product">
                  <Package className="mr-2 h-4 w-4" />
                  Quản lý sản phẩm
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((service) => (
          <Link key={service.id} href={`/service/${service.id}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-3xl w-12 h-12 flex items-center justify-center rounded-lg ${service.color} text-white`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {service.displayName}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {service.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Server className="w-3 h-3" />
                  <code className="bg-muted px-2 py-1 rounded">
                    {service.endpoint}
                  </code>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Thông tin hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Tổng số Services</p>
            <p className="text-3xl font-bold text-primary">{services.length}</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-xl font-bold text-green-600">🟢 Online</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">API Gateway</p>
            <p className="text-sm font-mono mt-1">localhost:8000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

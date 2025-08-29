"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Settings, Plus } from "lucide-react";
import Chart from "@/components/Chart";
import BollingerSettings from "@/components/BollingerSettings";
import {
  OHLCV,
  DEFAULT_BOLLINGER_SETTINGS,
  BollingerBandsSettings
} from "@/lib/types";

const Index = () => {
  const [ohlcvData, setOhlcvData] = useState<OHLCV[]>([]);
  const [bollingerSettings, setBollingerSettings] =
    useState<BollingerBandsSettings>(DEFAULT_BOLLINGER_SETTINGS);
  const [showBollinger, setShowBollinger] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load OHLCV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/ohlcv.json");
        const data: OHLCV[] = await response.json();
        setOhlcvData(data);
      } catch (error) {
        console.error("Failed to load OHLCV data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddBollinger = () => {
    setShowBollinger(true);
  };

  const handleRemoveBollinger = () => {
    setShowBollinger(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            FindScan Trading Platform
          </h1>
          <p className="text-muted-foreground">
            Professional Bollinger Bands analysis with KLineCharts integration
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicators</CardTitle>
            <CardDescription>
              Add and configure technical analysis indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {!showBollinger ? (
                <Button onClick={handleAddBollinger} variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bollinger Bands
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    Bollinger Bands Active
                  </Badge>
                  <Button
                    onClick={() => setSettingsOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={handleRemoveBollinger}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {showBollinger && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Length:</span>{" "}
                    {bollingerSettings.length}
                  </div>
                  <div>
                    <span className="font-medium">MA Type:</span>{" "}
                    {bollingerSettings.maType}
                  </div>
                  <div>
                    <span className="font-medium">StdDev:</span>{" "}
                    {bollingerSettings.stdDevMultiplier}
                  </div>
                  <div>
                    <span className="font-medium">Offset:</span>{" "}
                    {bollingerSettings.offset}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Chart</CardTitle>
            <CardDescription>
              Candlestick chart with technical indicators - {ohlcvData.length}{" "}
              data points loaded
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] p-4">
              <Chart
                data={ohlcvData}
                bollingerSettings={bollingerSettings}
                showBollinger={showBollinger}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Modal */}
        <BollingerSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={bollingerSettings}
          onSettingsChange={setBollingerSettings}
        />
      </div>
    </div>
  );
};

export default Index;

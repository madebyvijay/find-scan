"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BollingerBandsSettings } from "@/lib/types";

/**
 * Modal for editing Bollinger Bands settings.
 * The component keeps a local copy of settings to allow immediate
 * UI responsiveness; all changes are propagated up via
 * `onSettingsChange` so the parent can react (and persist if needed).
 */
interface BollingerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: BollingerBandsSettings;
  onSettingsChange: (settings: BollingerBandsSettings) => void;
}

const BollingerSettings = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange
}: BollingerSettingsProps) => {
  const [localSettings, setLocalSettings] =
    useState<BollingerBandsSettings>(settings);

  // Generic handler for top-level input fields (length, maType, source, etc.)
  const handleInputsChange = (
    field: keyof BollingerBandsSettings,
    value: unknown
  ) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    console.log(newSettings)
  };

  // Handler for nested `style` fields. We build a new object to
  // preserve React immutability expectations.
  const handleStyleChange = (
    band: "basis" | "upper" | "lower" | "fill",
    field: string,
    value: unknown
  ) => {
    const newSettings = {
      ...localSettings,
      style: {
        ...localSettings.style,
        [band]: {
          ...localSettings.style[band],
          [field]: value
        }
      }
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  // Small color picker helper that uses an ephemeral <input type="color" />
  // to present the native color chooser while also exposing a textual input.
  const ColorPicker = ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "color";
          input.value = value;
          input.onchange = (e) =>
            onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm"
        placeholder="#8b5cf6"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Bollinger Bands Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Length</Label>
                <Input
                  type="number"
                  value={localSettings.length}
                  onChange={(e) =>
                    handleInputsChange("length", parseInt(e.target.value))
                  }
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label>Basic MA Type</Label>
                <Select
                  value={localSettings.maType}
                  onValueChange={(value) => handleInputsChange("maType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMA">SMA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={localSettings.source}
                  onValueChange={(value) => handleInputsChange("source", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="close">Close</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>StdDev</Label>
                <Input
                  type="number"
                  value={localSettings.stdDevMultiplier}
                  onChange={(e) =>
                    handleInputsChange(
                      "stdDevMultiplier",
                      parseFloat(e.target.value)
                    )
                  }
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Offset</Label>
                <Input
                  type="number"
                  value={localSettings.offset}
                  onChange={(e) =>
                    handleInputsChange("offset", parseInt(e.target.value))
                  }
                  min="-50"
                  max="50"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-6 pt-4">
            {/* Basis Line */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">Basis Line</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Visible</Label>
                  <Switch
                    checked={localSettings.style.basis.visible}
                    onCheckedChange={(checked) =>
                      handleStyleChange("basis", "visible", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    value={localSettings.style.basis.color}
                    onChange={(color) =>
                      handleStyleChange("basis", "color", color)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Width</Label>
                  <Slider
                    value={[localSettings.style.basis.lineWidth]}
                    onValueChange={([value]) =>
                      handleStyleChange("basis", "lineWidth", value)
                    }
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">
                    {localSettings.style.basis.lineWidth}px
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Line Style</Label>
                  <Select
                    value={localSettings.style.basis.lineStyle}
                    onValueChange={(value) =>
                      handleStyleChange("basis", "lineStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Upper Band */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">Upper Band</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Visible</Label>
                  <Switch
                    checked={localSettings.style.upper.visible}
                    onCheckedChange={(checked) =>
                      handleStyleChange("upper", "visible", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    value={localSettings.style.upper.color}
                    onChange={(color) =>
                      handleStyleChange("upper", "color", color)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Width</Label>
                  <Slider
                    value={[localSettings.style.upper.lineWidth]}
                    onValueChange={([value]) =>
                      handleStyleChange("upper", "lineWidth", value)
                    }
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">
                    {localSettings.style.upper.lineWidth}px
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Line Style</Label>
                  <Select
                    value={localSettings.style.upper.lineStyle}
                    onValueChange={(value) =>
                      handleStyleChange("upper", "lineStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Lower Band */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">Lower Band</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Visible</Label>
                  <Switch
                    checked={localSettings.style.lower.visible}
                    onCheckedChange={(checked) =>
                      handleStyleChange("lower", "visible", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    value={localSettings.style.lower.color}
                    onChange={(color) =>
                      handleStyleChange("lower", "color", color)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Width</Label>
                  <Slider
                    value={[localSettings.style.lower.lineWidth]}
                    onValueChange={([value]) =>
                      handleStyleChange("lower", "lineWidth", value)
                    }
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">
                    {localSettings.style.lower.lineWidth}px
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Line Style</Label>
                  <Select
                    value={localSettings.style.lower.lineStyle}
                    onValueChange={(value) =>
                      handleStyleChange("lower", "lineStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Background Fill */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">Background Fill</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Visible</Label>
                  <Switch
                    checked={localSettings.style.fill.visible}
                    onCheckedChange={(checked) =>
                      handleStyleChange("fill", "visible", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opacity</Label>
                  <Slider
                    value={[localSettings.style.fill.opacity * 100]}
                    onValueChange={([value]) =>
                      handleStyleChange("fill", "opacity", value / 100)
                    }
                    min={1}
                    max={50}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(localSettings.style.fill.opacity * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BollingerSettings;

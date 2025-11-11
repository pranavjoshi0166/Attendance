import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Timetable() {
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const { toast } = useToast();

  // Load saved timetable on mount
  useEffect(() => {
    const saved = localStorage.getItem("timetable_image");
    const savedName = localStorage.getItem("timetable_image_name");
    if (saved) {
      setTimetableImage(saved);
      setImageName(savedName || "Timetable");
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTimetableImage(result);
      setImageName(file.name);
      
      // Save to localStorage
      localStorage.setItem("timetable_image", result);
      localStorage.setItem("timetable_image_name", file.name);
      
      toast({
        title: "Success",
        description: "Timetable uploaded successfully",
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = "";
  };

  const handleRemoveTimetable = () => {
    setTimetableImage(null);
    setImageName("");
    localStorage.removeItem("timetable_image");
    localStorage.removeItem("timetable_image_name");
    toast({
      title: "Removed",
      description: "Timetable removed successfully",
    });
  };

  const handleDownload = () => {
    if (!timetableImage) return;
    
    const link = document.createElement("a");
    link.href = timetableImage;
    link.download = imageName || "timetable.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "Timetable image downloaded",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Timetable</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Upload and view your class timetable
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Timetable</CardTitle>
            <CardDescription>
              Upload an image of your timetable (PNG, JPG, or other image formats)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!timetableImage ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  No timetable uploaded yet
                </p>
                <div className="space-y-2">
                  <Label htmlFor="timetable-upload" className="cursor-pointer">
                    <Button asChild variant="outline">
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="timetable-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum file size: 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{imageName}</p>
                    <p className="text-xs text-muted-foreground">
                      Timetable uploaded successfully
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveTimetable}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-card">
                  <img
                    src={timetableImage}
                    alt="Timetable"
                    className="w-full h-auto max-h-[800px] object-contain"
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    Want to replace this timetable? Click "Remove" and upload a new image.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Label htmlFor="timetable-replace" className="cursor-pointer">
                    <Button asChild variant="outline">
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Replace Timetable
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="timetable-replace"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Monitor, Share, MoreVertical, PlusSquare, Download } from 'lucide-react';

interface PwaInstallInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PwaInstallInstructions({ open, onOpenChange }: PwaInstallInstructionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Instalează Aplicația</DialogTitle>
          <DialogDescription>
            Urmează acești pași pentru a adăuga o scurtătură pe ecranul principal.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ios"><Smartphone className="mr-2 h-4 w-4"/>iPhone/iPad</TabsTrigger>
            <TabsTrigger value="android"><Monitor className="mr-2 h-4 w-4"/>Android/Desktop</TabsTrigger>
          </TabsList>
          <TabsContent value="ios" className="pt-4">
             <div className="space-y-4 text-sm text-muted-foreground">
                <p>1. Deschide aplicația în browser-ul <strong>Safari</strong>.</p>
                <p className="flex items-center">2. Apasă pe butonul de Partajare (o căsuță cu o săgeată în sus) din bara de jos: <Share className="mx-2 h-5 w-5 text-foreground" /></p>
                <p className="flex items-center">3. Derulează în jos și selectează <strong>"Adaugă pe ecranul principal"</strong> (Add to Home Screen): <PlusSquare className="mx-2 h-5 w-5 text-foreground" /></p>
                <p>4. Apasă pe "Adaugă" (Add) în colțul din dreapta sus.</p>
            </div>
          </TabsContent>
          <TabsContent value="android" className="pt-4">
             <div className="space-y-4 text-sm text-muted-foreground">
                <p>1. Deschide aplicația în browser-ul <strong>Chrome</strong>.</p>
                <p className="flex items-center">2. Apasă pe meniul cu trei puncte din colțul din dreapta sus: <MoreVertical className="mx-2 h-5 w-5 text-foreground" /></p>
                <p className="flex items-center">3. Selectează <strong>"Instalează aplicația"</strong> (Install App) sau <strong>"Adaugă la ecranul de pornire"</strong> (Add to Home Screen): <Download className="mx-2 h-5 w-5 text-foreground" /></p>
                <p>4. Confirmă acțiunea.</p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Am înțeles</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

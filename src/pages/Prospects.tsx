import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProspectsList from "@/components/prospects/ProspectsList";
import ProspectsGroupsView from "@/components/prospects/ProspectsGroupsView";
import AddProspectDialog from "@/components/prospects/AddProspectDialog";
import CreateGroupWithProspectsDialog from "@/components/prospects/CreateGroupWithProspectsDialog";
import ExportProspectsDialog from "@/components/prospects/ExportProspectsDialog";
import ImportProspectsDialog from "@/components/prospects/ImportProspectsDialog";
import { RoutingRulesDialog } from "@/components/prospects/RoutingRulesDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UsersThree, Download, Upload, Users, FolderSimple } from "@phosphor-icons/react";

const Prospects = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [routingDialogOpen, setRoutingDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("prospects");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Gestion des Prospects</h1>
            <p className="text-muted-foreground">
              Gérez tous vos prospects et organisez-les en groupes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setRoutingDialogOpen(true)}
            >
              Règles de routage
            </Button>
            <Button
              variant="outline"
              onClick={() => setGroupDialogOpen(true)}
            >
              <UsersThree className="mr-2 h-4 w-4" />
              Créer un Groupe
            </Button>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Prospect
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="prospects" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tous les Prospects
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <FolderSimple className="h-4 w-4" />
              Groupes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prospects" className="mt-6">
            <ProspectsList key={refreshKey} />
          </TabsContent>
          
          <TabsContent value="groups" className="mt-6">
            <ProspectsGroupsView 
              onCreateGroup={() => setGroupDialogOpen(true)}
              refreshKey={refreshKey}
            />
          </TabsContent>
        </Tabs>
        
        <AddProspectDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
        />
        
        <CreateGroupWithProspectsDialog
          open={groupDialogOpen}
          onOpenChange={setGroupDialogOpen}
          onGroupCreated={() => setRefreshKey((prev) => prev + 1)}
        />
        
        <ExportProspectsDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
        
        <ImportProspectsDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImportComplete={() => setRefreshKey((prev) => prev + 1)}
        />
        
        <RoutingRulesDialog
          open={routingDialogOpen}
          onOpenChange={setRoutingDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Prospects;

import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "info" | "success" | "warning" | "error";

interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export async function createNotification({
  title,
  message,
  type = "info",
  link,
}: CreateNotificationParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      title,
      message,
      type,
      link,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return data;
}

// Fonctions helper pour créer différents types de notifications
export const notificationHelpers = {
  // Notification pour nouvel prospect
  newProspect: (prospectName: string) =>
    createNotification({
      title: "Nouveau prospect ajouté",
      message: `${prospectName} a été ajouté à vos prospects`,
      type: "success",
      link: "/prospects",
    }),

  // Notification pour campagne envoyée
  campaignSent: (campaignName: string, recipientCount: number) =>
    createNotification({
      title: "Campagne envoyée",
      message: `La campagne "${campaignName}" a été envoyée à ${recipientCount} destinataire(s)`,
      type: "success",
      link: "/campaigns",
    }),

  // Notification pour email ouvert
  emailOpened: (prospectName: string, campaignName: string) =>
    createNotification({
      title: "Email ouvert",
      message: `${prospectName} a ouvert l'email de la campagne "${campaignName}"`,
      type: "info",
      link: "/campaigns",
    }),

  // Notification pour lien cliqué
  emailClicked: (prospectName: string, campaignName: string) =>
    createNotification({
      title: "Lien cliqué",
      message: `${prospectName} a cliqué sur un lien dans la campagne "${campaignName}"`,
      type: "success",
      link: "/campaigns",
    }),

  // Notification pour erreur d'envoi
  sendError: (campaignName: string) =>
    createNotification({
      title: "Erreur d'envoi",
      message: `Une erreur s'est produite lors de l'envoi de la campagne "${campaignName}"`,
      type: "error",
      link: "/campaigns",
    }),

  // Notification pour workflow déclenché
  workflowTriggered: (workflowName: string, prospectName: string) =>
    createNotification({
      title: "Workflow déclenché",
      message: `Le workflow "${workflowName}" a été déclenché pour ${prospectName}`,
      type: "info",
      link: "/workflow",
    }),

  // Notification pour groupe créé
  groupCreated: (groupName: string, prospectCount: number) =>
    createNotification({
      title: "Groupe créé",
      message: `Le groupe "${groupName}" a été créé avec ${prospectCount} prospect(s)`,
      type: "success",
      link: "/prospects",
    }),

  // Notification pour import CSV
  csvImported: (count: number) =>
    createNotification({
      title: "Import réussi",
      message: `${count} prospect(s) ont été importés avec succès`,
      type: "success",
      link: "/prospects",
    }),

  // Notification pour webinaire planifié
  webinarScheduled: (webinarTitle: string, date: string) =>
    createNotification({
      title: "Webinaire planifié",
      message: `Le webinaire "${webinarTitle}" est planifié pour le ${date}`,
      type: "info",
      link: "/webinars",
    }),
};

import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";

export async function getUserProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_projects")
      .select(
        `
        project_id,
        project:projects!inner(
          id,
          name,
          color,
          customer:customers!inner(id, name)
        )
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "getUserProjects");
    return [];
  }
}

export async function updateUserProjects(userId: string, projectIds: string[]) {
  try {
    // Delete existing associations
    const { error: deleteError } = await supabase
      .from("user_projects")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Insert new associations
    if (projectIds.length > 0) {
      const { error: insertError } = await supabase
        .from("user_projects")
        .insert(
          projectIds.map((projectId) => ({
            user_id: userId,
            project_id: projectId,
          })),
        );

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    handleError(error, "updateUserProjects");
    return false;
  }
}

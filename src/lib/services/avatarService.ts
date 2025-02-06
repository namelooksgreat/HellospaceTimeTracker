import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";

interface AvatarUploadResult {
  publicUrl: string;
  error?: Error;
}

export class AvatarService {
  private static readonly BUCKET_NAME = "avatars";
  private static readonly ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async uploadAvatar(
    file: File,
    userId: string,
  ): Promise<AvatarUploadResult> {
    try {
      // Validate file
      await this.validateFile(file);

      // Generate unique file path
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      return { publicUrl };
    } catch (error) {
      handleError(error, "AvatarService");
      return { error: error as Error, publicUrl: "" };
    }
  }

  private static async validateFile(file: File): Promise<void> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check file type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !this.ALLOWED_EXTENSIONS.includes(fileExt)) {
      throw new Error(
        `File type must be one of: ${this.ALLOWED_EXTENSIONS.join(", ")}`,
      );
    }

    // Additional validation could be added here (e.g., image dimensions)
  }

  static async deleteOldAvatar(userId: string): Promise<void> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (listError) throw listError;

      if (files && files.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(files.map((file) => `${userId}/${file.name}`));

        if (deleteError) throw deleteError;
      }
    } catch (error) {
      handleError(error, "AvatarService");
    }
  }
}

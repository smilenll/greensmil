import { notFound } from "next/navigation";
import { getPhotoById } from "@/actions/photo-actions";
import { PhotoEditPage } from "@/components/admin/photo-edit-page";

interface PageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function AdminPhotoEditPage({ params }: PageProps) {
  const { photoId } = await params;
  const response = await getPhotoById(photoId);

  if (response.status !== 'success') {
    notFound();
  }

  return <PhotoEditPage photo={response.data} />;
}

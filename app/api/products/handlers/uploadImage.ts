import { NextResponse } from "next/server";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/products/api";
import { ErpApiError, ErpNotConfiguredError, erpRequest } from "@/lib/erpApi";
import { getSessionUser } from "@/lib/session";

interface StandaloneUpload {
  images: string[];
  imageUrls: string[];
  imageUrlsExpireAt: number;
}

export async function handleUploadImage(form: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || !ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ message: "Only JPG, PNG or WebP images up to 10 MB can be uploaded." }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);
  try {
    const { images } = await erpRequest<StandaloneUpload>("/images", { method: "POST", body: upstream, actor: user.email });
    return NextResponse.json({ imageUrl: images[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof ErpNotConfiguredError) return NextResponse.json({ message: err.message }, { status: 503 });
    if (err instanceof ErpApiError) return NextResponse.json({ message: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ message: "Couldn't upload the image. Please try again." }, { status: 502 });
  }
}

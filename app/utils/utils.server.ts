import { readFileSync } from "fs";
import {
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import type { Readable } from "stream";

import { hash, compare } from "bcrypt";
import { s3UploadHandler } from "./s3.server";

const NUM_OF_SALTS = 10;

export type UploadHandlerData = {
  name: string;
  stream: Readable;
  filename: string;
  encoding: string;
  mimetype: string;
};

export async function parseMultipartFormData(
  request: Request
): Promise<FormData> {
  const uploadHandler = unstable_composeUploadHandlers(
    s3UploadHandler,
    unstable_createMemoryUploadHandler()
  );

  return unstable_parseMultipartFormData(request, uploadHandler);
}

export function getUploadBytes(request: Request): Buffer | null {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  if (query != null) {
    return readFileSync(query);
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, NUM_OF_SALTS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

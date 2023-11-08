import { UploadHandler, writeAsyncIterableToWritable } from "@remix-run/node";
// import { S3 } from "aws-sdk";
import { isEmpty } from "lodash-es";
import { PassThrough } from "stream";
import { v4 } from "uuid";
import { extname } from "path";

import pkg from "aws-sdk";
const { S3 } = pkg;

export const s3 = new S3({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const uploadStream = ({ Key }: Pick<AWS.S3.Types.PutObjectRequest, "Key">) => {
  const pass = new PassThrough();

  return {
    writeStream: pass,
    promise: s3
      .upload({
        Bucket: process.env.S3_BUCKET as string,
        Key: `${v4()}${Key}`,
        Body: pass,
        ACL: "public-read",
      })
      .promise(),
  };
};

export async function uploadStreamToS3(data: any, filename: string) {
  const stream = uploadStream({
    Key: extname(filename),
  });

  await writeAsyncIterableToWritable(data, stream.writeStream);
  const file = await stream.promise;
  return file.Location;
}

export const s3UploadHandler: UploadHandler = async ({
  name,
  filename,
  contentType,
  data,
}) => {
  console.log("S3 Handler", name, filename, contentType);
  if (!["cover", "video", "attachment"].includes(name)) {
    return null;
  }
  if (isEmpty(filename)) {
    return "";
  }
  const uploadedFileLocation = await uploadStreamToS3(data, filename!);
  return uploadedFileLocation;
};

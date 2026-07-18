"use client";

import StructuredData, { generateOrganizationData, generateLocalBusinessData, generateWebsiteData } from "./StructuredData";

export default function StructuredDataProvider() {
  return (
    <>
      <StructuredData data={generateWebsiteData()} />
      <StructuredData data={generateOrganizationData()} />
      <StructuredData data={generateLocalBusinessData()} />
    </>
  );
}

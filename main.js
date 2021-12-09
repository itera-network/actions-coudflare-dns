/**
 * Create CloudFlare DNS Record Action for GitHub
 * https://github.com/marketplace/actions/cloudflare-create-dns-record
 */

const path = require("path");
const cp = require("child_process");

const findRecord = ({
  type,
  name
}) => {
  //https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `https://api.cloudflare.com/client/v4/zones/${process.env.INPUT_ZONE}/dns_records?name=${name}&type=${type}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  if(result.length > 0){
    return result[0]
  }
  return null
};

const createRecord = ({
  type,
  name,
  content
}) => {
  // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "POST"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type,
      name,
      content,
    }),
    `https://api.cloudflare.com/client/v4/zones/${process.env.INPUT_ZONE}/dns_records`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }
  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  return result
};

const updateRecord = (id, {
  type,
  name,
  content
}) => {
  console.log(`Record exists with ${id}, updating...`);
  // https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "PUT"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type,
      name,
      content,
    }),
    `https://api.cloudflare.com/client/v4/zones/${process.env.INPUT_ZONE}/dns_records/${id}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }
  
  return result
}

if (process.env.INPUT_CID) {
  const newRecord = {
    type: "TXT",
    name: `_dnslink.${process.env.INPUT_NAME}`,
    content: `dnslink=/ipfs/${process.env.INPUT_CID}`
  }
  const oldRecord = findRecord({
    type: newRecord.type,
    name: newRecord.name
  });
  if (oldRecord) {
    const result = updateRecord(oldRecord.id, newRecord);
    console.log(`::set-output name=txt_record_id::${result.id}`);
    console.log(`::set-output name=txt_record_name::${result.name}`);
  } else {
    const result = createRecord(newRecord);
    console.log(`::set-output name=txt_record_id::${result.id}`);
    console.log(`::set-output name=txt_record_name::${result.name}`);
  }
}
if (process.env.INPUT_GATEWAY) {
  const newRecord = {
    type: "CNAME",
    name: process.env.INPUT_NAME,
    content: process.env.INPUT_GATEWAY
  }
  const oldRecord = findRecord({
    type: newRecord.type,
    name: newRecord.name
  });
  if (oldARecord) {
    const result = updateRecord(oldRecord.id, newRecord);
    console.log(`::set-output name=cname_record_id::${result.id}`);
    console.log(`::set-output name=cname_record_name::${result.name}`);
  } else {
    const result = createRecord(newRecord);
    console.log(`::set-output name=cname_record_id::${result.id}`);
    console.log(`::set-output name=cname_record_name::${result.name}`);
  }
}

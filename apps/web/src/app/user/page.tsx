import { backend } from "@backend";

export default async function UserPage() {
  const { databaseUrl} = backend.configFacade.config
  return <div>UserPage {databaseUrl}</div>
}

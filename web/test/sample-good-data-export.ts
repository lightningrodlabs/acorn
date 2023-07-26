import { AllProjectsDataExport } from "../src/migrating/export";
import testProfile from "../src/stories/testData/testProfile";

const sampleGoodDataExport: AllProjectsDataExport = {
  myProfile: testProfile,
  projects: [],
  integrityVersion: "8"
}

export {
  sampleGoodDataExport
}
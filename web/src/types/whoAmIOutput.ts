import { Profile } from ".";
import { WireRecord } from "../api/hdkCrud";
import { Option } from "./shared";

export type WhoAmIOutput = Option<WireRecord<Profile>>
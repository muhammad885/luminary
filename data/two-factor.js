import dbConnect from "@/lib/mongodb";
import TwoFactorConfirmation from "@/model/two-factor-confirmation";

export const runtime = 'nodejs'; // Explicit Node.js runtime

export async function deleteTwoFactorConfirmationById(id) {
  await dbConnect();
  return await TwoFactorConfirmation.findByIdAndDelete(id);
}

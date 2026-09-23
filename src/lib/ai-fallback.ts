import { fetchPublicProperties } from "@/lib/queries";
import { formatPriceForCard } from "@/lib/utils";
import type { PropertyListItem } from "@/types";

const CONTACT = "8950056231";

type Intent =
  | "rent"
  | "sale"
  | "types"
  | "contact"
  | "owner_contact"
  | "post"
  | "favorites"
  | "prices";

const INTENTS: Array<{ keys: RegExp; intent: Intent }> = [
  { keys: /(owner\s*se|contact property|contact karein|contact kar|call owner)/i, intent: "owner_contact" },
  { keys: /(favorite|save|saved|bookmark|pasandida)/i, intent: "favorites" },
  { keys: /(post property|list karein|property post|upload|property dalne|add property)/i, intent: "post" },
  { keys: /(contact|call|number|phone|whatsapp|madad|help|email)/i, intent: "contact" },
  { keys: /(sale|buy|kharid|kharidna|sold|plot|land|cash)/i, intent: "sale" },
  { keys: /(room|pg|12 bhk|1bhk|1 bhk|2 bhk|3 bhk|bhk|flat|house|ghar|dukan|shop)/i, intent: "types" },
  { keys: /(rent|kraye|kiraye|kiras|rental)/i, intent: "rent" },
  { keys: /(kitna|price|rate|cost|budget|tha char|kitne mein)/i, intent: "prices" },
];

function matchIntent(text: string): Intent | null {
  const lower = text.toLowerCase();
  for (const { keys, intent } of INTENTS) {
    keys.lastIndex = 0;
    if (keys.test(lower)) return intent;
  }
  return null;
}

async function findFromDb(
  intent: Extract<Intent, "rent" | "sale">,
  text: string,
  limit = 4
) {
  const city =
    /\bpundri\b/i.test(text) ? "Pundri"
    : /\bkaithal\b/i.test(text) ? "Kaithal"
    : undefined;
  const purpose = intent === "sale" ? "sale" : "rent";
  const { properties, count } = await fetchPublicProperties({
    purpose,
    city,
    pageSize: limit,
  });
  return { properties, count, city };
}

function formatLines(properties: PropertyListItem[]): string {
  return properties
    .map((p) => {
      const place = p.locality || p.city;
      return `• ${p.title} — ${place} — ${formatPriceForCard(p.price, p.purpose, p.rent_period)}`
        .slice(0, 200);
    })
    .slice(0, 4)
    .join("\n");
}

export async function buildLocalReply(
  lastMessage: string
): Promise<{ reply: string; matched: boolean }> {
  const intent = matchIntent(lastMessage);
  if (!intent) {
    return {
      matched: false,
      reply:
        "AI Agent abhi seedha LLM se baat nahi kar pa raha hai (network/key issue), isliye offline jawab de raha hoon. Aap pooch sakte hain:\n\n" +
        "• 'Kaithal mein 2 BHK rent par' — available rentals ke liye\n" +
        "• 'Pundri mein room ya PG' — rooms/PG ke liye\n" +
        "• 'Sale ke liye properties' — buy ke liye\n" +
        "• 'Owner se kaise contact karein?' / 'Property kaise post karein?'\n\n" +
        `Ya turant madad ke liye call/whatsapp: ${CONTACT}`,
    };
  }

  switch (intent) {
    case "contact":
      return {
        matched: true,
        reply:
          `MeraGhar par contact ke liye: WhatsApp/Call ${CONTACT} ya email tarunnaian41@gmail.com.\n\n` +
          "Kisi property ke owner se seedha baat karne ke liye login karke property page par 'Call Owner' / 'WhatsApp Owner' button use karein.",
      };

    case "owner_contact":
      return {
        matched: true,
        reply:
          "Owner se contact karne ke steps:\n" +
          "1. Property ka page kholen\n" +
          "2. Login karein (agar nahi kiya hai)\n" +
          "3. 'Call Owner' ya 'WhatsApp Owner' button dabayen\n\n" +
          `Agar koi problem aaye toh ${CONTACT} par call karein.`,
      };

    case "post":
      return {
        matched: true,
        reply:
          "Apni property list/bechni hai?\n" +
          "1. Website par 'Post Requirement' / 'Contact MeraGhar' se apni property ki details bhejein\n" +
          "2. MeraGhar team aapko call karegi\n" +
          "3. Property ki photos aur details team ke saath share karein\n" +
          "4. Approval ke baad listing website par dikh jayegi.",
      };

    case "favorites":
      return {
        matched: true,
        reply:
          "Saved/favorites ka feature ab sirf MeraGhar admin (aap) ke liye available hai.\n" +
          "Customers kisi bhi property card par 'Contact MeraGhar' se seedha admin se connect ho sakte hain.",
      };

    case "types": {
      const { properties, count, city } = await findFromDb("rent", lastMessage, 4);
      if (count === 0) {
        return {
          matched: true,
          reply: `Abhi ${city ?? "is area"} mein rent par rooms/flats ki listings nahi hain, lekin naye listings roz aati hain. /properties page check karein.`,
        };
      }
      return {
        matched: true,
        reply: `${city ? `${city} mein` : "Available"} rooms/flats rent par:\n${formatLines(properties)}\n\nFull list: /properties?purpose=rent`,
      };
    }

    case "prices":
    case "rent":
    case "sale": {
      const dbIntent: "rent" | "sale" = intent === "sale" ? "sale" : "rent";
      const { properties, count, city } = await findFromDb(dbIntent, lastMessage, 4);
      if (count === 0) {
        return {
          matched: true,
          reply: `Abhi ${city ?? "is area"} mein aisi listings nahi mili. /properties page par filters ke saath naye listings check karein.`,
        };
      }
      const head =
        intent === "sale"
          ? `${city ? `${city} mein` : "Available"} sale ke liye ${count} properties:`
          : `${city ? `${city} mein` : "Available"} ${count} rental listings:`;
      return {
        matched: true,
        reply: `${head}\n${formatLines(properties)}\n\nPoori list: /properties?purpose=${intent === "sale" ? "sale" : "rent"}`,
      };
    }
  }
}
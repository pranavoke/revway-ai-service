import axios from "axios";
import { IScrapeData } from "@/models/ScrapeData";

async function getScrapeData(url: string): Promise<IScrapeData> {
    const response = await axios.post<IScrapeData>(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/getScrapeData`,
      { url }
    );
    return response.data;
  }
  

export default getScrapeData;
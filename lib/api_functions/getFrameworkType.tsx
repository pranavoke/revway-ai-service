import axios from "axios";


async function getFrameworkType( url: string, Ad: string, Audience: number): Promise<any> {
  console.log("getFrameworkType", url, Ad, Audience);
    const response = await axios.post<any>(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/getFrameworkType`,
      {
        url : url ,
        Ad: Ad,
        Audience: Audience,
      }
    );

    return response.data;
}

export default getFrameworkType;
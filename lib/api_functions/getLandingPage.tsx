import axios from "axios";



async function getLandingPage( url: string,Ad : string , Audience : string, Framework:any ): Promise<any> {

  
  const response = await axios.post<any>(
    `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/automateV2`,
      {
        url : url ,
        Ad: Ad,
        Audience: Audience,
        Framework : Framework , 
       
      }
    );

    return response.data;
}

export default getLandingPage;
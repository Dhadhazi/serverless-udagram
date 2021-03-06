import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult,
} from "aws-lambda";
import "source-map-support/register";

import { verify } from "jsonwebtoken";
import { JwtToken } from "../../auth/JwtToken";

const certificate = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJKXxaFwJfetYMMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi03YXc3aHljYy5ldS5hdXRoMC5jb20wHhcNMjAxMjI3MTAwNjI0WhcN
MzQwOTA1MTAwNjI0WjAkMSIwIAYDVQQDExlkZXYtN2F3N2h5Y2MuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2JBXGsIRBNldCP7E
GE8NXwgYqdtvm6HE87wJeGo7I0sjGa8XeWnKyL21dQMSuyMrL09k0U+m26tHHmeK
8F6h2OOgbtBGmX01Zsnha0IpHRuvnaaZzMbocwh49p8VnAGHW1y44MzpXIJkrMYr
zm0htsOtdE48FlCdUIVNLKCKz+YofIn5imxWmBLHuE9j1efTmOq/heVZZfUQ7cnU
MGRJ8rgznToYwKadUqQQCvu22zgUCfTzHaOfRuE0aKo7mRd0J6oyvobDaUUaubGO
L6MOPpmL0bCelhfJCJSapTgl3YTr2sjiICeB8D8iApKqXqAz+dFbZKGrtvEx+2mw
DKdLBwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQpL994lTOa
eEt9ObstUSKViEamQTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ANFnsJ2fonhiF4EJrVS26AGa4tivtr+Goua7CpTqW3q93pmTOgnz2n2WEvTh2oAY
MLv5Fdm1DJpVOU+0q+NyiYVedU3wGopmwhQaN99vLJMQBXFHCfrZBuUHxjtRAD1k
080SnHyVFMmM8Vcva6TU1GaM6mnzEjILREg28xfHQkQLXdcejM+En1OOB0omRcK4
faZ3Fayrwm58kdWAJ8FzhdsxeXlK5+W/knbWRgunZSI90RDGQxFAAd0rFTZdVD9K
t30vuWpj7tBOcKRtPRaRsptwp327sgjO1nZ+01h04AmauK3Ao0s4+O8YUrfzXzoB
+zBMWLWUxBaSpZ4c0I71HYU=
-----END CERTIFICATE-----`;

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(event.authorizationToken, certificate);

    console.log("User was authorised");

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    console.log("User was not authorised", e.message);

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

function verifyToken(authHeader: string, certificate: string): JwtToken {
  if (!authHeader) throw new Error("No authorisation header");

  if (!authHeader.toLocaleLowerCase().startsWith("bearer "))
    throw new Error("Invalid authorisation header");

  const split = authHeader.split(" ");
  const token = split[1];

  return verify(token, certificate, { algorithms: ["RS256"] }) as JwtToken;
}

import { IQueryResultBindings } from "@comunica/actor-init-sparql";

import type { NextPage } from "next";
import { newEngine } from "@comunica/actor-init-sparql-solid";
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
} from "@inrupt/solid-client-authn-browser";
import { Fragment, useEffect, useState } from "react";

const Home: NextPage = () => {
  const engine = newEngine();

  const [webId, setWebId] = useState(getDefaultSession().info.webId);

  const solidLoginHandler: React.MouseEventHandler = async (e) => {
    e.preventDefault();

    login({
      redirectUrl: window.location.href,
      oidcIssuer: "https://solid.tschenten.ch",
      clientName: "Remo Dietlicher's CV",
    });
    setWebId(getDefaultSession().info.webId);
  };

  useEffect(() => {
    // After redirect, the current URL contains login information.
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then((info) => {
      console.log(info);
      setWebId(getDefaultSession().info.webId);
    });
  }, []);

  const selectQueryHandler = async () => {
    const selectQuery = `
      SELECT * WHERE {
        ?s <http://xmlns.com/foaf/0.1/name> ?o.
      }
    `;

    const raw = await engine.query(selectQuery, {
      sources: [getDefaultSession().info.webId],
      "@comunica/actor-http-inrupt-solid-client-authn:session":
        getDefaultSession(),
    });

    const bindings = await (raw as IQueryResultBindings).bindings();

    bindings.forEach((b) => console.log(b.get("?s").value));
  };

  const insertQueryHandler = async () => {
    const insertQuery = `
      INSERT DATA {
        <${
          getDefaultSession().info.webId?.split("#")[0]
        }#Heidi> <http://xmlns.com/foaf/0.1/name> 'Heidi'
      }
    `;

    console.log(insertQuery);

    const res = await engine.query(insertQuery, {
      sources: [getDefaultSession().info.webId],
      "@comunica/actor-http-inrupt-solid-client-authn:session":
        getDefaultSession(),
    });

    await (res as any).updateResult;
  };

  return (
    <Fragment>
      <button onClick={selectQueryHandler}>select</button>
      <button onClick={insertQueryHandler}>insert</button>
      <button onClick={solidLoginHandler}>login</button>
    </Fragment>
  );
};

export default Home;

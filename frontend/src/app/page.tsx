import Image from "next/image";
import styles from "./page.module.css";
import ClassicComponent from "@/components/random/component1";
//import {getClient} from "@/components/apollo/apolloClient";
//import { type ArticlesQuery } from "@/graphql/gql";

//const { data:articlesData } = await getClient().query<ArticlesQuery>({ query: articlesQuery });

export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ClassicComponent />
        {/*<ol>*/}
        {/*  {articlesData?.articles?.map((article) => (*/}
        {/*      <li key={article?.uniqueId}>*/}
        {/*        <div>*/}
        {/*          <div className={'img-wrapper'} style={{width: '100%', minHeight: '15vh', position: 'relative'}}>*/}
        {/*          <Image src={`${process.env.STRAPI_LOCAL_URL}${article?.author?.avatar?.url}`} objectFit={'cover'} fill={true} alt={article?.author?.avatar?.alternativeText as string ?? 'alternativeText'} />*/}
        {/*          </div>*/}
        {/*          </div>*/}
        {/*      </li>*/}
        {/*  ))}*/}
        {/*</ol>*/}

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

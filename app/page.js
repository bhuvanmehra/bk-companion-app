import Image from 'next/image';
import styles from './page.module.css';
import FileUpload from './components/FileUpload';

const Page = async () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src='/next.svg'
          alt='Next.js logo'
          width={180}
          height={38}
          priority
        />
        <FileUpload />
      </main>
    </div>
  );
};

export default Page;

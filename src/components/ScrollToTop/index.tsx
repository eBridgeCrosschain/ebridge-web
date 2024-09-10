import { useRouter } from 'next/router';
import { useRef } from 'react';
import { useUpdateEffect } from 'react-use';

export default function ScrollToTop() {
  const router = useRouter();

  const scrollRef = useRef<Element>();

  useUpdateEffect(() => {
    if (!scrollRef.current) {
      scrollRef.current = document.getElementsByClassName('page-body-wrap')[0];
    }
    scrollRef.current?.scrollTo(0, 0);
  }, [router]);

  return null;
}

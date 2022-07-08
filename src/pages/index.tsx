import Link from 'next/link';
import { useEffect } from 'react';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from './_app';

const Home: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const postsQuery = trpc.useQuery(['post.all']);
  const addPost = trpc.useMutation('post.add', {
    async onSuccess() {
      // refetches posts after a post is added
      await utils.invalidateQueries(['post.all']);
    },
  });

  // prefetch all posts for instant navigation
  useEffect(() => {
    for (const { id } of postsQuery.data ?? []) {
      utils.prefetchQuery(['post.byId', { id }]);
    }
  }, [postsQuery.data, utils]);
  return (
    <div className="">
      <h2>
        Posts
        {postsQuery.status === 'loading' && '(loading)'}
      </h2>
      {postsQuery.data?.map((item) => (
        <Link key={item.id} href={`/post/${item.id}`}>
          <article className="cursor-pointer">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        </Link>
      ))}
      <br />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          /**
           * In a real app you probably don't want to use this manually
           * Checkout React Hook Form - it works great with tRPC
           * @link https://react-hook-form.com/
           */

          const $body: HTMLInputElement = (e as any).target.elements.body;
          const $title: HTMLInputElement = (e as any).target.elements.title;
          const input = {
            title: $title.value,
            body: $body.value,
          };
          try {
            await addPost.mutateAsync(input);

            $title.value = '';
            $body.value = '';
          } catch {}
        }}
      >
        <label htmlFor="title">Title:</label>
        <br />
        <input
          id="title"
          name="title"
          type="text"
          disabled={addPost.isLoading}
        />

        <br />
        <label htmlFor="body">Text:</label>
        <br />
        <textarea id="body" name="body" disabled={addPost.isLoading} />
        <br />
        <input type="submit" disabled={addPost.isLoading} />
        {addPost.error && (
          <p style={{ color: 'red' }}>{addPost.error.message}</p>
        )}
      </form>
    </div>
  );
};

export default Home;

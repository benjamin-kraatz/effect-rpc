import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    return {
      ok: true,
      data: "Welcome to the home page!",
    };
  },
});

function Home() {
  const { data } = Route.useLoaderData();
  return (
    <div className="p-2">
      <h3>{data}</h3>
    </div>
  );
}

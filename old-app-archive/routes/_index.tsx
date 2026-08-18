import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => [
    { title: "My Stuff" },
    { name: "description", content: "Description" },
    { name: "keywords", content: "Keywords" },
    { name: "author", content: "Author" },
    { name: "robots", content: "index, follow" },
];

const Index = () => {
    return (
        <div>
            
        </div>
    );
}

export default Index
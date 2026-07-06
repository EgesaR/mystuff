import type { Route } from './+types/about';

export const meta: Route.MetaFunction = () => [
    { title: "My Stuff - About It" },
    { name: "description", content: "Description" },
    { name: "keywords", content: "Keywords" },
    { name: "author", content: "Author" },
    { name: "robots", content: "index, follow" },
];

const About = () => {
    return (
        <div>
            
        </div>
    );
}

export default About
import { useEffect, useState } from "react";
import { mockServer } from "../../lib/mock-server";
import { deleteTag, getTags } from "../shared/tagMocks";
import { api } from "../../lib/api-client";
import { Tag } from "../shared/tagModel";
import { Button } from "../../components/button/Button";

mockServer.registerMockObjects([deleteTag, getTags]);

// TODO: HIERARCHICAL TAGS - FLAT OBJECTS DESIGN

export function TagsManager() {
    const [tagsList, setTagsList] = useState<Array<Tag>>([]);
    useEffect(() => {
        api.mock(100)
            .get(getTags.url, {})
            .then((data) => setTagsList(data))
            .catch((err) => console.error(err));
    }, []);
    function removeTag(id: number) {
        api.mock()
            .delete(deleteTag.url, { id: id })
            .then((d) => {
                console.log(d);
                return api.mock().get(getTags.url, {});
            })
            .then((d) => setTagsList(d))
            .catch((err) => console.error(err));
    }
    return (
        <>
            <ul>
                {tagsList?.map((t, idx) => (
                    <li className="flex flex-row mt-1" key={t.id}>
                        <span>{t.label}</span>
                        <Button className="ml-1 h-6" onClick={() => removeTag(t.id)}>
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
        </>
    );
}

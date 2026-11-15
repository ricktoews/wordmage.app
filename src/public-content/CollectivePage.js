import { useEffect, useState } from 'react';
import { CollectiveLanding } from './CollectiveLanding.mjs';
import { getCollectiveNouns } from '../utils/api';
import { normalizeCollectiveResponse } from './collective-response.mjs';

let pending;
function loadCollection() {
    if (!pending) pending = getCollectiveNouns().then(normalizeCollectiveResponse).finally(() => { pending = undefined; });
    return pending;
}
export default function CollectivePage(props) {
    const [collection, setCollection] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        loadCollection().then(data => { if (active) setCollection(data); })
            .catch(() => { if (active) setError('Unable to load the latest collection. Showing a saved collection.'); });
        return () => { active = false; };
    }, []);
    return <CollectiveLanding {...props} collection={collection} loadError={error} />;
}

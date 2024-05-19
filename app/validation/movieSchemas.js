import { z } from 'zod';

const schema = {
    getId: z.number().int().min(1).max(1000000000),
    getMoviesWithQueries : z.object({   
        page : z.string(),
        //include_adult: z.boolean(),
        year: z.string(),
        sort_by: z.string().refine(value => ['popularity.asc', 'popularity.desc',
         'release_date.asc', 'release_date.desc',
          'revenue.asc', 'revenue.desc', 'primary_release_date.asc',
           'primary_release_date.desc', 'title.asc', 'title.desc',
            'vote_average.asc', 'vote_average.desc', 'vote_count.asc', 'vote_count.desc'].includes(value), 
            { message: 'sort_by must be one of popularity.asc, popularity.desc, release_date.asc, release_date.desc, revenue.asc, revenue.desc, primary_release_date.asc, primary_release_date.desc, title.asc, title.desc, vote_average.asc, vote_average.desc, vote_count.asc, vote_count.desc' }),
    }), 
};

export default schema;  


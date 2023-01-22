using Microsoft.EntityFrameworkCore;

namespace Application.Core;

public class PageList<T> : List<T>
{
    public PageList(IEnumerable<T> items, int count, int pageNumber, int pageSize)
    {
        CurrentPage = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        PageSize = pageSize;
        TotalCount = count;
        AddRange(items);
    }

    public PageList(IEnumerable<T> items, int count, PagingParams param)
    {
        CurrentPage = param.PageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)param.PageSize);
        PageSize = param.PageSize;
        TotalCount = count;
        AddRange(items);
    }

    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }

    public static async Task<PageList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize)
    {
        var count = await source.CountAsync();

        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PageList<T>(items, count, pageNumber, pageSize);
    }

    public static async Task<PageList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize,
        CancellationToken cancellationToken)
    {
        var count = await source.CountAsync(cancellationToken);

        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PageList<T>(items, count, pageNumber, pageSize);
    }

    public static async Task<PageList<T>> CreateAsync(IQueryable<T> source, PagingParams param)
    {
        var count = await source.CountAsync();

        var items = await source.Skip((param.PageNumber - 1) * param.PageSize).Take(param.PageSize).ToListAsync();
        return new PageList<T>(items, count, param);
    }


    public static async Task<PageList<T>> CreateAsync(IQueryable<T> source, PagingParams param,
        CancellationToken cancellationToken)
    {
        var count = await source.CountAsync(cancellationToken);

        var items = await source.Skip((param.PageNumber - 1) * param.PageSize).Take(param.PageSize)
            .ToListAsync(cancellationToken);
        return new PageList<T>(items, count, param);
    }
}
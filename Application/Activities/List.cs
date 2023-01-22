using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Persistence;

namespace Application.Activities;

public class List
{
    public class Query : IRequest<Result<PageList<ActivityDto>>>
    {
        public ActivityParams Params { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<PageList<ActivityDto>>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
        {
            _context = context;
            _mapper = mapper;
            _userAccessor = userAccessor;
        }

        public async Task<Result<PageList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = _context.Activities
                .Where(d => d.Date >= request.Params.StartDate)
                .OrderBy(d => d.Date)
                .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider,
                    new { currentUserName = _userAccessor.GetUserName() })
                .AsQueryable();

            if (request.Params.IsGoing && !request.Params.IsHost)
                query = query.Where(x => x.Attendees.Any(a => a.UserName == _userAccessor.GetUserName()));

            if (request.Params.IsHost && !request.Params.IsGoing)
                query = query.Where(x => x.HostUserName == _userAccessor.GetUserName());

            return Result<PageList<ActivityDto>>.Success(
                await PageList<ActivityDto>.CreateAsync(query, request.Params, cancellationToken)
            );
        }
    }
}
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Profile = Application.Profiles.Profile;

namespace Application.Followers;

public class List
{
    public class Query : IRequest<Result<List<Profile>>>
    {
        public string Predicate { get; set; }
        public string UserName { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<List<Profile>>>
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

        public async Task<Result<List<Profile>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var profile = new List<Profile>();

            switch (request.Predicate)
            {
                case "followers":
                    profile = await _context.UserFollowings.Where(x => x.Target.UserName == request.UserName)
                        .Select(u => u.Observer).ProjectTo<Profile>(_mapper.ConfigurationProvider,
                            new { currentUserName = _userAccessor.GetUserName() })
                        .ToListAsync(cancellationToken);
                    break;
                case "following":
                    profile = await _context.UserFollowings.Where(x => x.Observer.UserName == request.UserName)
                        .Select(u => u.Target).ProjectTo<Profile>(_mapper.ConfigurationProvider,
                            new { currentUserName = _userAccessor.GetUserName() })
                        .ToListAsync(cancellationToken);
                    break;
                default:
                    return null;
            }

            return Result<List<Profile>>.Success(profile);
        }
    }
}